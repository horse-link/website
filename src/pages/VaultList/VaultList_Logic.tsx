import VaultListView from "./VaultList_View";
import useVaults from "../../hooks/useVaults";
import { useState } from "react";

const VaultList: React.FC = () => {
  const { vaultAddresses } = useVaults();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVaultAddress, setSelectedVaultAddress] = useState("");

  const onClickVault = (vaultAddress: string) => {
    setSelectedVaultAddress(vaultAddress);
    setIsDialogOpen(true);
  };

  return (
    <VaultListView
      vaultAddressList={vaultAddresses}
      onClickVault={onClickVault}
      isDialogOpen={isDialogOpen}
      onCloseDialog={() => setIsDialogOpen(false)}
      selectedVaultAddress={selectedVaultAddress}
    />
  );
};

export default VaultList;