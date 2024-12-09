import request from '@/utils/request';

export function getRateList(){
  return request({
    url: '/rate',
    method: 'get',
  });
}

export function updateRate(id,value){
  return request({
    url: `/rate/edit/${id}`,
    method: 'put',
    params: {rateValue:value},  
  });
}


