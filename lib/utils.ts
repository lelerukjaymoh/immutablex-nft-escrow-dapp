export const displayPartialAddress = (address: string): string => {
    if (!address || address.length < 8) {
        return address;
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}