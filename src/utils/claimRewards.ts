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


interface ProtocolInfo {
	claim_id: string;
	recipient: string;
	amount: {
			value: number;
	};
	proof: any; 
}

interface Contract {
	populateTransaction: {
			claim: (args: any, proof: any) => any; // Adjust the type of 'args' based on your contract's claim function signature
	};
}

interface RewardsObject {
	[claim_id: string]: any; // Adjust the type based on what the rewards data looks like
}





