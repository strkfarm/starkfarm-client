import CONSTANTS from "@/constants";
import axios from "axios";

export const getEkuboRewards = async (addr: any) => {
  const { data } = await axios.get(`/ekubo/airdrops/${CONSTANTS.EKUBO.TEST_ADDRESS}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`);
  return data;
};


export const getNostraRewards = async (addr: any) => {
  const { data } = await axios.get(`/ekubo/airdrops/${CONSTANTS.EKUBO.TEST_ADDRESS}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`);
  return data;
};

export const getZklendRewards = async ({ address }: any) => {
  const { data } = await axios.get(
    `/zklend/api/reward/all/${CONSTANTS.ZKLEND.TEST_ADDRESS}`
  );
  return data.filter((item: any) => item.type === "defispring");
};


