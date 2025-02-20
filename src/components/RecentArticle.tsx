import { Article } from "../../data/Article";
import { formatDateString } from "../../utilities/date";
import truncate from "html-truncate";

interface RecentArticleProps {
  article: Article;
  setActive: React.Dispatch<React.SetStateAction<Article | null>>;
}

function RecentArticle({ article, setActive }: RecentArticleProps) {
  return (
    <div
      className="recent p-3 rounded-2xl  flex w-full  linear-gradient-bg opacity-50 transition-opacity duration-200 hover:opacity-100 "
      onClick={() => setActive(article)}
    >
      <div className="flex-[0.8] flex flex-col justify-center">
        {article?.assets?.length > 0 && (
          <img src={article.assets[0].url} alt="" className="aspect-square" />
        )}
        <p className="my-4 bg-[var(--postbg)] text-center text-white uppercase text-md py-3 rounded-2xl">
          POSTED ON {formatDateString(article.datePosted)}
        </p>
      </div>
      <div className="flex-1 ml-4">
        <h2 className="text-xl font-bold text-white uppercase">
          {article.title.substring(0, 50)}
        </h2>
        <div
          className="text-white font-light uppercase text-sm mt-8"
          dangerouslySetInnerHTML={{
            __html: truncate(
              article.body.replace(/style="[^"]*color:[^"]*"/gi, ""),
              250
            ),
          }}
        />
      </div>
    </div>
  );
}

export default RecentArticle;
