import axios from "axios";

const TEST_ADDRESS =
	"0x00541681b9ad63dff1b35f79c78d8477f64857de29a27902f7298f7b620838ea";

export const getEkuboRewards = async (addr: string) => {
	const { data } = await axios.get(`/ekubi/${addr}`);
	return data;
};

export const getZklendRewards = async ({address}: any) => {
	const { data } = await axios.get(`/zklend/api/reward/all/${TEST_ADDRESS}`);
	return data.filter((item: any) => item.type === "defispring");
};
