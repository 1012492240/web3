/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'lightweight-charts' {
  export interface ChartOptions {
    width?: number;
    height?: number;
    layout?: {
      background?: {
        color?: string;
      };
      textColor?: string;
    };
    grid?: {
      vertLines?: {
        color?: string;
      };
      horzLines?: {
        color?: string;
      };
    };
    timeScale?: {
      timeVisible?: boolean;
      secondsVisible?: boolean;
      borderColor?: string;
    };
    rightPriceScale?: {
      borderColor?: string;
      scaleMargins?: {
        top: number;
        bottom: number;
      };
    };
  }

  export interface CandlestickSeriesOptions {
    upColor?: string;
    downColor?: string;
    borderVisible?: boolean;
    wickUpColor?: string;
    wickDownColor?: string;
  }

  export interface HistogramSeriesOptions {
    color?: string;
    priceFormat?: {
      type: string;
    };
    priceScaleId?: string;
    scaleMargins?: {
      top: number;
      bottom: number;
    };
  }

  export interface IChartApi {
    applyOptions(options: ChartOptions): void;
    resize(width: number, height: number): void;
    timeScale(): ITimeScaleApi;
    addCandlestickSeries(options?: CandlestickSeriesOptions): ICandlestickSeriesApi;
    addHistogramSeries(options?: HistogramSeriesOptions): IHistogramSeriesApi;
    remove(): void;
  }

  export interface ITimeScaleApi {
    fitContent(): void;
  }

  export interface ISeriesApi<T> {
    setData(data: T[]): void;
  }

  export interface ICandlestickSeriesApi extends ISeriesApi<CandlestickData> {
    // Additional methods specific to candlestick series
    priceFormat(format: PriceFormat): void;
    markers(): SeriesMarker<CandlestickData>[];
  }

  export interface IHistogramSeriesApi extends ISeriesApi<HistogramData> {
    // Additional methods specific to histogram series
    priceFormat(format: PriceFormat): void;
    color(color: string): void;
  }

  export interface PriceFormat {
    type: string;
    precision?: number;
    minMove?: number;
  }
  
  export interface SeriesMarker<T> {
    time: T['time'];
    position: 'aboveBar' | 'belowBar' | 'inBar';
    shape: 'arrow' | 'circle' | 'square';
    color: string;
    id?: string;
    text?: string;
    size?: number;
  }

  export interface CandlestickData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }

  export interface HistogramData {
    time: number;
    value: number;
    color?: string;
  }

  export function createChart(container: HTMLElement, options?: ChartOptions): IChartApi;

  export type ColorType = 'solid' | 'gradient';
}
