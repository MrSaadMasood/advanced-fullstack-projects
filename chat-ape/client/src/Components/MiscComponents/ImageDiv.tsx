export default function ImageDiv({image} : { image : string}) {
      return (
        <div className=" w-14 h-14 lg:w-10 lg:h-10 rounded-full overflow-hidden">
                    <img src={`${image}`} alt="" />
        </div>
        );
    }