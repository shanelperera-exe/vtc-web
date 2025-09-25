const BuyNowBtn = () => {
  return (
    <div className="bg-white flex items-start">
      <div className="group relative h-fit w-fit">
        <div
          className="absolute inset-0 z-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 pointer-events-none"
          // style={{
          //   clipPath:
          //     'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)',
          // }}
        ></div>
        <button
          type="button"
          className="relative z-10 cursor-pointer overflow-hidden font-medium text-base py-2 px-6 bg-[#0bd964] text-black w-55 shimmer_shine__jD_i0 transition-all flex items-center justify-center gap-2 group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:-translate-x-0 group-active:-translate-y-0"
          // style={{
          //   clipPath:
          //     'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)',
          // }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-bag"
            viewBox="0 0 16 16"
          >
            <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
          </svg>
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  )
}

export default BuyNowBtn;