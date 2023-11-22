import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "./index.module.css"

// getServerSideProps空渡されるpropsの方
type Props = {
    initialImageUrl: string;
}

const IndexPage: NextPage<Props> = ({ initialImageUrl }) => {
    //useStateを使って状態を定義する
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [loading, setLoading] = useState(false);
    // マウント時に可増を読み込む宣言
    useEffect(() => {
        fetchImage().then((newImage) => {
            setImageUrl(newImage.url);
            setLoading(false);
        });
    }, []);
    // ボタンをクリックした時に画像を読み込む処理
    const handleClick = async () => {
        setLoading(true);//読み込み中フラグを立てる
        const newImage = await fetchImage();
        setImageUrl(newImage.url);
        setLoading(false);
    };
    return (
        <div className={styles.page}>
            <button onClick={handleClick} className={styles.button}>他の猫も見る</button>
            <div>{loading || <img src={imageUrl} className={styles.img} />}</div>
        </div>
    )
};
export default IndexPage;

// サーバサイドで実行する処理
export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const image =await fetchImage();
    return {
        props: {
            initialImageUrl: image.url,
        },
    };
};

type Image = {
    url: string;
  };
  const fetchImage = async (): Promise<Image> => {
    const res = await fetch("https://api.thecatapi.com/v1/images/search");
    const images = await res.json();
    // 配列として表現されているか
    if (!Array.isArray(images)) {
        throw new Error("猫の画像が取得できませんでした");
    }
    const image: unknown = images[0];
    // Imageの構造をなしているか？
    if (!isImage(image)) {
        throw new Error("猫の画像が取得できませんでした");
    }
    return image;
  };

// 型ガード関数
const isImage = (value: unknown): value is Image => {
    //値がオブジェクトなのか？
    if (!value || typeof value !== "object") {
        return false;
    }
    // url プロパティが存在しかつ俺が文字列なのか
    return "url" in value && typeof value.url === "string";
};