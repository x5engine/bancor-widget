export const safeFetch = async (...args) => {
    return fetch(...args).then(res => {
        if (res.ok) {
            return res.json();
        }

        throw Error("response not ok");
    });
};


export const textFetch = async (...args) => {
    return fetch(...args).then(res => {
        if (res.ok) {
            return res;
        }

        throw Error("response not ok");
    });
};

