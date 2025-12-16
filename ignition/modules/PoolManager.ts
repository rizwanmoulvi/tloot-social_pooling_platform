import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./Token";

const PoolManagerModule = buildModule("PoolManagerModule", (m) => {
  const { platformToken } = m.useModule(TokenModule);

  const poolManager = m.contract("PoolManager", [platformToken]);

  // Transfer token ownership to PoolManager so it can mint rewards
  m.call(platformToken, "transferOwnership", [poolManager]);

  return { platformToken, poolManager };
});

export default PoolManagerModule;
