import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import Overview from '../src/components/Overview';
import Table from '../src/components/Table';
import Layout from '../src/components/Layout';

const Home: NextPage = () => {
  return (
    <Layout home>
      <Overview />
      <Table />
    </Layout>
  );
};

export default Home;
