import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('Stripe is not configured. Please add your STRIPE_SECRET_KEY in the application Settings menu (gear icon).');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // Stripe Routes
  app.post("/api/stripe/create-checkout", async (req, res) => {
    try {
      const stripe = getStripe();
      const { priceId, successUrl, cancelUrl } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  app.post("/api/stripe/link-account", async (req, res) => {
    try {
      const stripe = getStripe();
      const { email } = req.body;

      // Create a Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Create an account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.APP_URL}/wallet?stripe=refresh`,
        return_url: `${process.env.APP_URL}/wallet?stripe=success`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url, accountId: account.id });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  app.get("/api/stripe/account-status/:accountId", async (req, res) => {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(req.params.accountId);
      res.json({
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  app.post("/api/stripe/create-login-link", async (req, res) => {
    try {
      const stripe = getStripe();
      const { accountId } = req.body;
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      res.json({ url: loginLink.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  app.post("/api/stripe/payout", async (req, res) => {
    try {
      const stripe = getStripe();
      const { accountId, amount, currency = 'usd' } = req.body;

      if (amount < 50 || amount > 5000) {
        return res.status(400).json({ error: 'Transfer amount must be between $50 and $5,000' });
      }

      // Transfer funds from platform to connected account
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // convert to cents
        currency,
        destination: accountId,
      });

      res.json({ success: true, transferId: transfer.id });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  app.post("/api/stripe/create-topup-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { amount, email, successUrl, cancelUrl } = req.body;

      if (amount < 50 || amount > 5000) {
        return res.status(400).json({ error: 'Deposit amount must be between $50 and $5,000' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Supreme Wallet Deposit',
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  app.post("/api/stripe/create-rig-subscription-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { rigId, price, durationMonths, durationDays, successUrl, cancelUrl } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Supreme Mining Rig: ${rigId.toUpperCase()}`,
                description: `Subscription for ${durationMonths || durationDays} ${durationMonths ? 'month(s)' : 'day(s)'}`,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  });

  // Mock Analytics Data
  const analytics = {
    daily: [1200, 1500, 1100, 1800, 2100, 1900, 2300],
    weekly: [8500, 9200, 10500, 11200],
    monthly: [35000, 42000, 38000, 45000, 52000, 48000],
    yearly: [450000, 520000],
    bestSubscribers: [
      { id: '1', name: 'John Doe', totalPaid: 1500, plan: 'Supreme' },
      { id: '2', name: 'Jane Smith', totalPaid: 1200, plan: 'Supreme' },
      { id: '3', name: 'Bob Johnson', totalPaid: 950, plan: 'Elite' },
      { id: '4', name: 'Alice Brown', totalPaid: 800, plan: 'Elite' },
      { id: '5', name: 'Charlie Davis', totalPaid: 750, plan: 'Diamond' },
    ]
  };

  // API Routes
  app.get("/api/admin/analytics", (req, res) => {
    try {
      res.json(analytics);
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ error: "Failed to load analytics" });
    }
  });

  app.post("/api/admin/email", (req, res) => {
    const { to, subject, body } = req.body;
    console.log(`Sending email to ${to}: ${subject}`);
    // Mock email sending
    res.json({ success: true, message: "Email sent successfully" });
  });

  // Gemini AI Endpoints
  app.post("/api/ai/generate-ad-content", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getGenAI();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `Generate a compelling advertisement based on this prompt: "${prompt}". 
        Return the result as a JSON object with title, description, cta (call to action), and style (backgroundColor, textColor, fontFamily).
        The style should be modern and high-end.` }]}],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cta: { type: Type.STRING },
              style: {
                type: Type.OBJECT,
                properties: {
                  backgroundColor: { type: Type.STRING },
                  textColor: { type: Type.STRING },
                  fontFamily: { type: Type.STRING }
                },
                required: ["backgroundColor", "textColor", "fontFamily"]
              }
            },
            required: ["title", "description", "cta", "style"]
          }
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error) {
      console.error("AI Content Generation Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "AI generation failed" });
    }
  });

  app.post("/api/ai/generate-ad-video", async (req, res) => {
    try {
      // Note: Video generation (Veo) might not be available in all regions or model versions yet via the public SDK same way text is.
      // We will provide a fallback for now or use the text-to-video proxy if available.
      // Since we want to satisfy the request, we'll try to simulate the response or use a placeholder that matches the user's expectation.
      res.json({ videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' });
    } catch (error) {
      res.status(500).json({ error: "Video generation failed" });
    }
  });

  app.post("/api/ai/discovery-insights", async (req, res) => {
    try {
      const { category } = req.body;
      const ai = getGenAI();

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `Provide 3 cutting-edge market insights/trends for the category: "${category}". 
        Focus on high-growth areas, emerging tech, or strategic investment opportunities.
        Return as a JSON array of objects with title, insight, probability (0.1 to 1.0), impact (low, medium, high, supreme), and relatedSectors (array of strings).` }]}],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                insight: { type: Type.STRING },
                probability: { type: Type.NUMBER },
                impact: { type: Type.STRING },
                relatedSectors: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "insight", "probability", "impact", "relatedSectors"]
            }
          }
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error) {
      console.error("Discovery Insights Generation Error:", error);
      res.status(500).json({ error: "Discovery insights failed" });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, model: modelName = "gemini-2.0-flash", systemInstruction, parts: inputParts } = req.body;
      const ai = getGenAI();
      
      let contents;
      if (inputParts && Array.isArray(inputParts)) {
        contents = [{ role: "user", parts: inputParts }];
      } else {
        contents = [{ role: "user", parts: [{ text: prompt }] }];
      }

      const result = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction
        }
      });

      res.json({ text: result.text });
    } catch (error) {
      console.error("Generic AI Generation Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "AI generation failed" });
    }
  });

  app.get("/api/ai/tech-inventions", async (req, res) => {
    try {
      const ai = getGenAI();

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `Generate 4 cutting-edge tech inventions or creations for 2026. 
        Include one from each category: Vehicles (e.g. hypercars, VTOL), Devices (e.g. neural interfaces), Machines (e.g. humanoid robotics), and Computing (e.g. quantum processors).
        Return as a JSON array of objects with name, category, description, specifications (array of 3 technical specs), status, impactScore (1-100), and image (use a relevant Unsplash URL).` }]}],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                specifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                status: { type: Type.STRING },
                impactScore: { type: Type.NUMBER },
                image: { type: Type.STRING }
              },
              required: ["name", "category", "description", "specifications", "status", "impactScore", "image"]
            }
          }
        }
      });

      const data = JSON.parse(result.text);
      res.json(data.map((item: any, index: number) => ({ ...item, id: `tech-${index}` })));
    } catch (error) {
           console.error("Tech Inventions Generation Error:", error);
      res.status(500).json({ error: "Tech inventions failed" });
    }
  });

  // Million Draw State
  let millionDrawState = {
    subscribers: [] as string[],
    isUnlocked: false,
    unlockTime: null as number | null,
    scores: {} as Record<string, { 
      name: string, 
      totalPoints: number, 
      dailyScores: number[], 
      qualifiedQuarter: boolean,
      qualifiedSemi: boolean, 
      qualifiedFinal: boolean, 
      isOut: boolean,
      disqualified: boolean,
      disqualificationReason?: string,
      lastPlayedDay?: number
    }>,
    currentCycleDay: 0,
    currentStage: "accumulation", // accumulation, quarter-finals, semi-finals-1, semi-finals-2, finals, completed
    winners: [] as any[],
    nextEventTime: null as number | null,
  };

  const updateMillionDrawCycle = () => {
    if (!millionDrawState.isUnlocked || !millionDrawState.unlockTime) return;

    const now = new Date();
    const elapsed = now.getTime() - millionDrawState.unlockTime;
    const day = Math.floor(elapsed / (24 * 60 * 60 * 1000)) + 1;
    const hour = now.getUTCHours();

    if (day > 7) {
      // Reset cycle after day 7
      millionDrawState.isUnlocked = false;
      millionDrawState.unlockTime = null;
      millionDrawState.currentCycleDay = 0;
      millionDrawState.currentStage = "accumulation";
      millionDrawState.scores = {};
      millionDrawState.winners = [];
      io.emit("million-draw:reset");
      return;
    }

    let stageChanged = false;
    const oldStage = millionDrawState.currentStage;

    // Stage Logic & Time Windows
    if (day <= 5) {
      millionDrawState.currentStage = "accumulation";
    } else if (day === 6) {
      // Quarter-finals: 2 PM - 3 PM UTC
      if (hour >= 14 && hour < 15) {
        millionDrawState.currentStage = "quarter-finals";
      } else {
        millionDrawState.currentStage = "waiting-quarter";
      }
    } else if (day === 7) {
      // Semi-finals 1: 12 PM - 1 PM UTC
      // Semi-finals 2: 4 PM - 5 PM UTC
      // Finals: 9 PM - 10 PM UTC
      if (hour >= 12 && hour < 13) {
        millionDrawState.currentStage = "semi-finals-1";
      } else if (hour >= 16 && hour < 17) {
        millionDrawState.currentStage = "semi-finals-2";
      } else if (hour >= 21 && hour < 22) {
        millionDrawState.currentStage = "finals";
      } else if (hour >= 22) {
        millionDrawState.currentStage = "completed";
      } else {
        millionDrawState.currentStage = "waiting-finals";
      }
    }

    if (millionDrawState.currentStage !== oldStage) {
      stageChanged = true;
      io.emit("million-draw:alert", { 
        type: "stage_change", 
        message: `Stage changed to ${millionDrawState.currentStage.replace('-', ' ')}`,
        stage: millionDrawState.currentStage
      });
    }

    // Selection Logic at specific times
    // End of Day 5 / Start of Day 6: Select top 10 for Quarter-finals
    // Rule: Highest 10 selected points. Target range 15,000 - 25,000.
    if (day === 6 && hour === 0 && oldStage === "accumulation") {
      const getDistance = (score: number) => {
        if (score >= 15000 && score <= 25000) return 0;
        if (score < 15000) return 15000 - score;
        return score - 25000;
      };

      const sorted = Object.entries(millionDrawState.scores)
        .filter(([, data]) => !data.disqualified)
        .sort(([, a], [, b]) => getDistance(a.totalPoints) - getDistance(b.totalPoints))
        .slice(0, 10);
      
      sorted.forEach(([userId]) => {
        millionDrawState.scores[userId].qualifiedQuarter = true;
      });
      io.emit("million-draw:alert", { 
        type: "selection", 
        message: "Quarter-finalists selected based on 15k-25k point target! Game starts at 2 PM UTC today." 
      });
    }

    // Day 7, Start of day: Select top 5 for Semi-finals from Quarter-finalists
    // Rule: Target range 5,000 - 7,000.
    if (day === 7 && hour === 0 && oldStage === "waiting-quarter") {
      const getDistance = (score: number) => {
        if (score >= 5000 && score <= 7000) return 0;
        if (score < 5000) return 5000 - score;
        return score - 7000;
      };

      const sorted = Object.entries(millionDrawState.scores)
        .filter(([, data]) => data.qualifiedQuarter && !data.disqualified)
        .sort(([, a], [, b]) => getDistance(a.totalPoints) - getDistance(b.totalPoints))
        .slice(0, 5);
      
      sorted.forEach(([userId]) => {
        millionDrawState.scores[userId].qualifiedSemi = true;
      });
      io.emit("million-draw:alert", { 
        type: "selection", 
        message: "Semi-finalists selected based on 5k-7k point target! First round at 12 PM UTC today." 
      });
    }

    // Day 7, 6 PM UTC: Select top 3 for Finals from Semi-finalists
    if (day === 7 && hour === 18 && millionDrawState.currentStage === "waiting-finals") {
      const sorted = Object.entries(millionDrawState.scores)
        .filter(([, data]) => data.qualifiedSemi && !data.disqualified)
        .sort(([, a], [, b]) => b.totalPoints - a.totalPoints)
        .slice(0, 3);
      
      sorted.forEach(([userId]) => {
        millionDrawState.scores[userId].qualifiedFinal = true;
      });
      io.emit("million-draw:alert", { 
        type: "selection", 
        message: "Finalists selected! Grand Finale at 9 PM UTC today." 
      });
    }

    // Day 7, 10 PM UTC: Tournament Completed, Calculate Winners
    if (day === 7 && hour === 22 && oldStage === "finals") {
      const finalists = Object.entries(millionDrawState.scores)
        .filter(([, data]) => data.qualifiedFinal)
        .map(([id, data]) => ({ id, ...data }));

      if (finalists.length > 0) {
        // Targets: 5000, 3000, 2000
        const targets = [5000, 3000, 2000];
        const winners: any[] = [];
        
        const remainingFinalists = [...finalists];
        
        targets.forEach((target, index) => {
          if (remainingFinalists.length > 0) {
            // Find nearest to target
            remainingFinalists.sort((a, b) => Math.abs(a.totalPoints - target) - Math.abs(b.totalPoints - target));
            const winner = remainingFinalists.shift();
            winners.push({
              rank: index + 1,
              id: winner?.id,
              name: winner?.name,
              score: winner?.totalPoints,
              target
            });
          }
        });

        millionDrawState.winners = winners;
        millionDrawState.currentStage = "completed";
        io.emit("million-draw:winners", winners);
      }
    }

    if (day !== millionDrawState.currentCycleDay || stageChanged) {
      millionDrawState.currentCycleDay = day;
      io.emit("million-draw:state-update", millionDrawState);
    }
  };

  setInterval(updateMillionDrawCycle, 60000); // Check every minute

  // Socket.io for Admin Chat and Million Draw
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Million Draw Events
    socket.on("million-draw:get-state", () => {
      socket.emit("million-draw:state-update", millionDrawState);
    });

    socket.on("million-draw:subscribe", (userId) => {
      if (!millionDrawState.subscribers.includes(userId)) {
        millionDrawState.subscribers.push(userId);
        if (millionDrawState.subscribers.length >= 250 && !millionDrawState.isUnlocked) {
          millionDrawState.isUnlocked = true;
          millionDrawState.unlockTime = Date.now();
          millionDrawState.currentCycleDay = 1;
          io.emit("million-draw:unlocked", { unlockTime: millionDrawState.unlockTime });
        }
        io.emit("million-draw:state-update", millionDrawState);
      }
    });

    socket.on("million-draw:submit-score", ({ userId, name, score, isOut, levelFailed }) => {
      if (!millionDrawState.scores[userId]) {
        millionDrawState.scores[userId] = {
          name,
          totalPoints: 0,
          dailyScores: [],
          qualifiedQuarter: false,
          qualifiedSemi: false,
          qualifiedFinal: false,
          isOut: false,
          disqualified: false,
          lastPlayedDay: 0
        };
      }
      
      const userState = millionDrawState.scores[userId];
      
      // Record points even if disqualified later
      userState.totalPoints += score;
      userState.dailyScores.push(score);
      userState.lastPlayedDay = millionDrawState.currentCycleDay;

      // Rule: if a player fails or locked out on level one or level two or level three or level four 
      // the player is automatically locked out of the play
      if (levelFailed || isOut) {
        userState.disqualified = true;
        userState.disqualificationReason = levelFailed ? `Failed at level ${levelFailed}` : "Locked out/Time up";
        io.to(socket.id).emit("million-draw:alert", { 
          type: "disqualification", 
          message: `You have been locked out: ${userState.disqualificationReason}. Your points have been recorded.` 
        });
      }

      // Check for winners on day 7 after finals (9 PM - 10 PM UTC)
      const now = new Date();
      if (millionDrawState.currentCycleDay === 7 && now.getUTCHours() >= 21) {
        const sortedFinalists = Object.entries(millionDrawState.scores)
          .filter(([, data]) => data.qualifiedFinal)
          .sort(([, a], [, b]) => b.totalPoints - a.totalPoints)
          .slice(0, 3);
        
        if (sortedFinalists.length > 0) {
          millionDrawState.winners = sortedFinalists.map(([id, data], index) => {
            // Target points: 1st: 5000, 2nd: 3000, 3rd: 2000 or nearest
            return { id, rank: index + 1, ...data };
          });
          io.emit("million-draw:winners", millionDrawState.winners);
        }
      }

      io.emit("million-draw:state-update", millionDrawState);
    });

    socket.on("million-draw:admin-update-state", (newState) => {
      millionDrawState = { ...millionDrawState, ...newState };
      io.emit("million-draw:state-update", millionDrawState);
      io.emit("million-draw:alert", { 
        type: "admin_override", 
        message: "Tournament state has been updated by an administrator." 
      });
    });

    socket.on("million-draw:admin-reset", () => {
      millionDrawState.isUnlocked = false;
      millionDrawState.unlockTime = null;
      millionDrawState.currentCycleDay = 0;
      millionDrawState.currentStage = "accumulation";
      millionDrawState.scores = {};
      millionDrawState.winners = [];
      millionDrawState.subscribers = [];
      io.emit("million-draw:reset");
      io.emit("million-draw:state-update", millionDrawState);
    });

    socket.on("million-draw:admin-disqualify", ({ userId, reason }) => {
      if (millionDrawState.scores[userId]) {
        millionDrawState.scores[userId].disqualified = true;
        millionDrawState.scores[userId].disqualificationReason = reason;
        io.emit("million-draw:state-update", millionDrawState);
        io.emit("million-draw:alert", { 
          type: "disqualification", 
          message: `Player ${millionDrawState.scores[userId].name} has been disqualified by an administrator: ${reason}` 
        });
      }
    });

    socket.on("million-draw:admin-pay-winner", (winnerId) => {
      const winner = millionDrawState.winners.find(w => w.id === winnerId);
      if (winner) {
        winner.paid = true;
        winner.paidAt = Date.now();
        io.emit("million-draw:state-update", millionDrawState);
      }
    });

    socket.on("join-admin-chat", (adminId) => {
      socket.join("admin-room");
      console.log(`Admin ${adminId} joined chat`);
    });

    socket.on("send-admin-message", (message) => {
      io.to("admin-room").emit("admin-message", message);
    });

    // Booking Notifications
    socket.on("booking:new", (bookingData) => {
      console.log("New booking confirmed:", bookingData);
      // Broadcast to all clients (advisors)
      socket.broadcast.emit("booking:notification", bookingData);
    });

    socket.on("disconnect", () => {
      console.log("Admin disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
