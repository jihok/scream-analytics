import type { NextPage } from 'next';
import Overview from '../src/components/Overview';
import Table from '../src/components/Table';
import Layout from '../src/components/Layout';

const Home: NextPage = () => {
  return (
    <Layout home="markets">
      <div className="px-5 lg:px-10">
        <h1 className="pb-6 lg:hidden">Market analytics</h1>
        <Overview />
      </div>
      <Table />
    </Layout>
  );
};

export default Home;
