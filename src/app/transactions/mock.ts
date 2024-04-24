const data = Array.from(new Array(100).keys()).map((item) => {
  return {
    status: 'Failed',
    transactionId: item + 'cc764efe0d5b8f9a73fffa3aecc7e3a26d715a715a764af464dd80dd7f2ca03e',
    blockHeight: 165018684,
    method: 'DonateResourceToken',
    timestamp: '2023-08-15T08:42:41.1123602Z',
    from: JSON.stringify({
      name: 'AELF',
      address: 'YgRDkJECvrJsfcrM3KbjMjNSPfZPhmbrPjTpssWiWZmGxGiWy',
    }),
    to: JSON.stringify({
      name: 'AELF',
      address: 'AELF.Contract.Token',
    }),
    transactionValue: 0,
    transactionFee: 0,
  };
});
export default async function fetchData({ page, pageSize }): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    total: 100,
    data: data.slice((page - 1) * pageSize, page * pageSize),
  };
}