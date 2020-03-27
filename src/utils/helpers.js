export const getTokenImgByBancor = async symbol => {
    return safeFetch(`https://api.bancor.network/0.1/currencies/${symbol}`).then(
        res => {
            if (!res || !res.data) return;

            const imgFile = res.data.primaryCommunityImageName || "";
            const [name, ext] = imgFile.split(".");

            return `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
        }
    );
};

// get relevant token data
export const getTokenData = async (eth, address) => {
    const _bancorNetwork = get(bancorNetwork);
    const _bntToken = get(bntToken);

    const token = await Contract(eth, "ERC20Token", address);

    const [name, symbol, decimals = 18, isEth, isBNT] = await Promise.all([
        token.methods.name().call(),
        token.methods.symbol().call(),
        token.methods.decimals().call(),
        _bancorNetwork.methods.etherTokens(token.address).call(),
        token.address === _bntToken.address
    ]);

    // const img = await getTokenImgByBancor(symbol);
    const img = `https://rawcdn.githack.com/crypti/cryptocurrencies/ed13420a6b22b25bbed53e2cbe6d8db302ec0c6a/images/${symbol}.png`;

    return {
        address,
        name,
        symbol,
        img,
        decimals,
        toSmallestAmount: amount => toDecimals(amount, decimals),
        toDisplayAmount: amount => fromDecimals(amount, decimals),
        isEth,
        isBNT
    };
};

export const useStateWithLocalStorage = localStorageKey => {
    const [cart, setCart] = React.useState(
        JSON.parse(localStorage.getItem(localStorageKey)) || []
    );
    React.useEffect(() => {
        console.log('cart updated', cart);
        localStorage.setItem(localStorageKey, JSON.stringify(cart));
    }, [cart]);

    return [cart, setCart];
};