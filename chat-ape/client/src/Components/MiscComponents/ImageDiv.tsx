import LazyLoad from 'react-lazy-load';
export default function ImageDiv({image} : { image : string}) {
      return (
        <LazyLoad className=" w-14 h-14 lg:w-10 lg:h-10 rounded-full overflow-hidden">
          <img src={`${image}`} alt="" data-testid="lazyImage" />
        </LazyLoad>
        );
    }