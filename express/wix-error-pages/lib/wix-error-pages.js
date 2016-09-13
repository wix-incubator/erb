module.exports = () => {
  return {
    render500: () => {
      return 'Internal Server Error';
    },
    render504: () => {
      return 'Gateway Timeout';
    }
  };
}
