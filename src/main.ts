import './style.css'

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Box-Muller法による正規乱数生成関数
function generateNormalRandom(mean:number, stdDev:number):number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}


// 試行回数分の乱数を生成
function simulateTrials(trialCount:number, mean:number, stdDev:number) {
  const samples = [];
  for (let i = 0; i < trialCount; i++) {
    samples.push(generateNormalRandom(mean, stdDev));
  }
  return samples;
}


// サンプルからヒストグラムデータを作成
function getHistogramData(samples:number[], binCount:number) {
  const min = samples.reduce((a, b) => Math.min(a, b));
  const max = samples.reduce((a, b) => Math.max(a, b));

  // すべてのサンプルが同じ場合の特別処理
  if (min === max) {
    return {
      labels: [min.toFixed(2)],
      bins: [samples.length]
    };
  }  
  const binWidth = (max - min) / binCount;
  const bins = new Array(binCount).fill(0);
  for (const sample of samples) {
    let binIndex = Math.floor((sample - min) / binWidth);
    binIndex = Math.min(binIndex,binIndex - 1);
    bins[binIndex]++;
  }
  // ビンの中心値をラベルとして使用
  const labels = bins.map((_, i) => (min + binWidth * (i + 0.5)).toFixed(2));
  return { labels, bins };
}



let myChart:Chart;
const ctx = (document.getElementById('chartCanvas') as HTMLCanvasElement).getContext('2d');
if(!ctx){
  throw new Error("ctx is null");
}

(document.getElementById('simulateButton') as HTMLButtonElement).addEventListener('click', (event) => {
  event.preventDefault();
  const trialCount = parseInt((document.getElementById('trialCount') as HTMLInputElement).value, 10);
  const mean = parseFloat((document.getElementById('mean') as HTMLInputElement).value);

  const hp = parseFloat((document.getElementById('hp') as HTMLInputElement).value);
  // 90%ileのz値
  const z90 = 1.28155;
  const stdDev = (hp-mean) / z90;

  (document.getElementById('stdDev') as HTMLInputElement).value=`${stdDev}`;
  
  
  const samples = simulateTrials(trialCount, mean, stdDev);
  const histogramData = getHistogramData(samples, 20);

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: histogramData.labels,
      datasets: [{
        label: '頻度',
        data: histogramData.bins,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '回数'
          }
        },
        x: {
          title: {
            display: true,
            text: '工数[人日]'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `ABP:${mean} HP:${hp} 試行回数: ${trialCount}`
        }
      }
    }
  });
});