import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./Token";
import MockUSDTModule from "./MockUSDT";

const PoolManagerUSDTModule = buildModule("PoolManagerUSDTModule", (m) => {
  const { platformToken } = m.useModule(TokenModule);
  const { mockUSDT } = m.useModule(MockUSDTModule);
  
  const poolManager = m.contract("PoolManager", [platformToken, mockUSDT]);
  
  // Transfer token ownership to pool manager so it can mint rewards
  m.call(platformToken, "transferOwnership", [poolManager]);
  
  return { platformToken, mockUSDT, poolManager };
});

export default PoolManagerUSDTModule;
