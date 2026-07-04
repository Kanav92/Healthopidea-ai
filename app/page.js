import Feed from "@components/Feed";

const Home = () => {
  return (
    <section className="w-full flex-center flex-col">
      <h1 className="head_text text-center">
        Discover & Share
        <br className="max-md:hidden" />
        <span className="orange_gradient text-center"> AI-Powered Health Prompts</span>
      </h1>
      <p className="desc text-center">
        Healthopedia AI is an open-source platform for discovering, sharing, and using AI prompts for health and wellness. Chat with our medical AI assistant powered by RAG technology.
      </p>
      <Feed />
    </section>
  );
};

export default Home;
