import CONSTANTS from "@/constants";
import axios from "axios";

export const getEkuboRewards = async (addr: string) => {
  const { data } = await axios.get(`/ekubi/${addr}`);
  return data;
};

export const getZklendRewards = async ({ address }: any) => {
  const { data } = await axios.get(
    `/zklend/api/reward/all/${CONSTANTS.TEST_ADDRESS}`
  );
  return data.filter((item: any) => item.type === "defispring");
};
