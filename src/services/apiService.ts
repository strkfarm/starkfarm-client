import CONSTANTS from "@/constants";
import axios from "axios";

export const getEkuboRewards = async (addr: any) => {
  const TEST_ADDRESS = "0x06e7b0064a821f0f9933c760b9fe1c6bda37af7d5fd4f82d47c2b671fba113dd"
  const { data } = await axios.get(`/ekubo/airdrops/${TEST_ADDRESS}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`);
  return data;
};


export const getNostraRewards = async (addr: any) => {
  const TEST_ADDRESS = "0x06e7b0064a821f0f9933c760b9fe1c6bda37af7d5fd4f82d47c2b671fba113dd"
  const { data } = await axios.get(`/ekubo/airdrops/${TEST_ADDRESS}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`);
  return data;
};

export const getZklendRewards = async ({ address }: any) => {
  const { data } = await axios.get(
    `https://app.zklend.com/api/reward/all/${CONSTANTS.TEST_ADDRESS}`
  );
  return data.filter((item: any) => item.type === "defispring");
};


