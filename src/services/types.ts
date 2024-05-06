export interface ClaimRewardsProps {
  abi: any;
  claim_contract: string;
  claim_id: number;
  claimee: string;
  claimed?: boolean;
  amount: string | number;
  proof: any[];
}
