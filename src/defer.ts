const defer = (func: () => void) => {
    setTimeout(func, 0);
};
export default defer;