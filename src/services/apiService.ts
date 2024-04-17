import axios from "axios";

export const getEkuboRewards = async (addr: string) => {
	const { data } = await axios.get(`/ekubi/${addr}`);
	return data;
};

export const getZklendRewards = async ({ queryKey }: any) => {
  console.log(queryKey);
	const { data } = await axios.get(`/zklend/${""}`);
	return data;
};
