import { IoIosClose } from 'react-icons/io';

type IntroProps = {
  onClose: () => void;
};

export const Intro = ({ onClose }: IntroProps) => {
  return (
    <div className="p-6 bg-white text-center text-gray-800 bg-opacity-65 rounded-lg shadow-lg my-6 max-w-2xl mx-auto">
      <div className="flex justify-end hover:cursor-pointer ">
        <IoIosClose onClick={onClose} size={25} />
      </div>
      <p className="text-lg font-semibold font-Poppins">
        Syntra is a cutting-edge dApp powered by Massa's autonomous smart
        contracts, designed to simplify token scheduling like never before.
      </p>
      <p className="text-lg mt-2">
        Whether you're tipping content creators or managing token vesting,
        Syntra ensures seamless, automated transactions.
      </p>
    </div>
  );
};
