import { Request, Response, NextFunction } from 'express';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';

const sanitize = (req: Request, res: Response, next: NextFunction) => {
  const { description } = req.body;
  const html = (marked as any).parse(description);

  const sanitizedHtml = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'ins']),
    allowedAttributes: {
      '*': ['href', 'target', 'align', 'alt', 'center', 'bgcolor', 'style', 'class']
    },
    allowedStyles: {
      '*': {
        // Match HEX and RGB
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        // Match any number with px, em, or %
        'font-size': [/^\d+(?:px|em|%)$/],
        'font-weight': [/^bold$/],
        'text-decoration': [/^underline$/],
        'background-color': [/^#(0x)?[0-9a-f]+$/i]
      }
    }
  });

  req.body.description = sanitizedHtml;

  next();
};

export default sanitize;
