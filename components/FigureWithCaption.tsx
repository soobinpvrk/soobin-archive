import Image from "next/image";
import styles from "./FigureWithCaption.module.css";

type FigureWithCaptionProps = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export function FigureWithCaption({
  src,
  alt,
  caption,
  width = 1200,
  height = 800,
}: FigureWithCaptionProps) {
  return (
    <figure className={styles.figure}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={styles.image}
        sizes="(max-width: 680px) 100vw, 680px"
      />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
