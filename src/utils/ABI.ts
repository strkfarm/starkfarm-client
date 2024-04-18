import { ProviderInterface } from "starknet";

interface ContractABIInterface {
	provider: ProviderInterface;
	address: string;
}

export const getContractABI = async ({ provider, address }: ContractABIInterface) => {
	try {
		const compressedContract = await provider.getClassAt(address);
		return compressedContract.abi;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};
