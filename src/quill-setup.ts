import { Quill } from 'react-quill-new';

const Font = Quill.import('formats/font') as any;
Font.whitelist = [
  'arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida', 'tahoma', 'times-new-roman', 'trebuchet', 'verdana', 
  'impact', 'roboto', 'open-sans', 'lato', 'montserrat', 'oswald', 'raleway', 'merriweather', 'nunito', 'playfair-display', 
  'ubuntu', 'poppins', 'rubik', 'work-sans', 'fira-sans'
];
Quill.register(Font, true);

const Size = Quill.import('formats/size') as any;
Size.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px', '72px'];
Quill.register(Size, true);

export const quillModules = {
  toolbar: [
    [{ 'font': Font.whitelist }],
    [{ 'size': Size.whitelist }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

export const quillFormats = [
  'font', 'size',
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'color', 'background',
  'align',
  'link', 'image', 'video'
];
