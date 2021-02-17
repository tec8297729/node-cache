type AxiosArrType = Promise<any>[];

/**
 *  Promise异步调用全部数据请求，统一处理返回
 */
export const promiseAll = (axiosArr: AxiosArrType): Promise<any> => {
  return new Promise((resolve) => {
    if (!Array.isArray(axiosArr)) {
      throw new TypeError('axiosArr must be an array');
    }

    const result: AxiosArrType = [];
    let count = 0;

    const pushResult = (saveData: any, index: number) => {
      result[index] = saveData;
      count += 1;
      if (count === axiosArr.length) {
        resolve(result);
      }
    };

    axiosArr.forEach((axiosItem, index) => {
      Promise.resolve(axiosItem)
        .then((res) => {
          pushResult(res, index);
        })
        .catch((err) => {
          pushResult(err, index);
        });
    });
  });
};
