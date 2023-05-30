import { Request, Response, NextFunction } from 'express';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';

const sanitize = (req: Request, res: Response, next: NextFunction) => {
  const { description } = req.body;
  const html = (marked as any).parse(description);

  const sanitizedHtml = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      img: ['src', 'alt']
    }
  });

  req.body.description = sanitizedHtml;

  next();
};

export default sanitize;
