import './Card.css';

export default function Card({ children, className = '', ...props }) {
  return (
    <article className={`card ${className}`} {...props}>
      {children}
    </article>
  );
}

function CardImage({ src, alt, aspectRatio }) {
  const style = aspectRatio ? { aspectRatio } : {};
  return (
    <div className="card__image-wrapper" style={style}>
      <img
        className="card__image"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function CardBody({ children }) {
  return <div className="card__body">{children}</div>;
}

function CardTitle({ children }) {
  return <h3 className="card__title">{children}</h3>;
}

function CardText({ children }) {
  return <p className="card__text">{children}</p>;
}

Card.Image = CardImage;
Card.Body = CardBody;
Card.Title = CardTitle;
Card.Text = CardText;
