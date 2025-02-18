function RecentArticle() {
  return (
    <div className="recent p-3 rounded-2xl  flex w-full  linear-gradient-bg opacity-50 transition-opacity duration-200 hover:opacity-100 ">
      <div className="flex-[0.8]">
        <img src="/images/test.jpg" alt="" />
        <p className="my-4 bg-[var(--postbg)] text-center text-white uppercase text-xl py-3 rounded-2xl">
          POSTED ON 01/16/25
        </p>
      </div>
      <div className="flex-1 ml-4">
        <h2 className="text-xl font-bold text-white uppercase">
          Tagisan ng Talino at Ganda, Tampok sa Ika...
        </h2>
        <p className="text-white font-semibold uppercase text-sm mt-8">
          Nag-umapaw sa talino, talento, at kagandahan ang ikaapat na araw ng IS
          Week 2025: Reinos Oceania kahapon, 15 Enero 2025, dahil sa
          makapigil-hiningang debate at sa pinakahihintay ng lahat: ang labanan
          ng mga kalahok para sa Mr. & Ms. Integrated School Junior High School
          2025....
        </p>
      </div>
    </div>
  );
}

export default RecentArticle;
