import axios from "axios";

const EKUBO_BASE_URL = process.env.NEXT_PUBLIC_EKUBO_LINK;
const ZKLEND_BASE_URL = process.env.NEXT_PUBLIC_ZKLEND_LINK;


export const getEkuboRewards = async (addr: string) => {
	const { data } = await axios.get(`${EKUBO_BASE_URL}/${addr}`);
	return data;
};


export const getZklendRewards = async (addr: string) => {
	const { data } = await axios.get(`${ZKLEND_BASE_URL}/${addr}`);
	return data;
};
