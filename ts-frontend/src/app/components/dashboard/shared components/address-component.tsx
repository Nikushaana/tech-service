import { useEffect } from "react";
import { Button } from "../../ui/button";
import { LuPlus } from "react-icons/lu";
import { PiMapPinFill } from "react-icons/pi";
import { AiOutlineDelete } from "react-icons/ai";
import { useAddressesStore } from "@/app/store/useAddressesStore";
import { Loader2Icon } from "lucide-react";

interface AddressComponentProps {
  type: "company" | "individual"; // type of addresses
}

export default function AddressComponent({ type }: AddressComponentProps) {
  const {
    addresses,
    fetchAddresses,
    toggleOpenCreateAddressModal,
    loadingDelete,
    deleteAddress,
  } = useAddressesStore();

  useEffect(() => {
    fetchAddresses(type); // fetch correct type on mount
  }, [type]);

  return (
    <div className="w-full flex flex-col gap-y-[30px] items-center">
      <Button
        onClick={() => toggleOpenCreateAddressModal(type)}
        className="cursor-pointer h-[40px]"
      >
        <LuPlus className="text-[18px]" /> მისამართის დამატება
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-[20px] max-w-[400px] lg:max-w-none w-full lg:w-auto items-stretch">
        {addresses.map((item: any) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-200 h-full lg:max-w-[400px] lg:w-full transform hover:-translate-y-1 rounded-xl p-[14px] flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[45px] aspect-square rounded-full bg-gray-100 text-myLightBlue text-[24px] flex items-center justify-center">
                  <PiMapPinFill />
                </div>
                <h2 className="text-[20px]">{item.name}</h2>
              </div>
              <Button
                onClick={() => deleteAddress(type, item.id)}
                disabled={loadingDelete}
                className="bg-[red] hover:bg-[#b91c1c] text-[20px] cursor-pointer"
              >
                {loadingDelete ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <AiOutlineDelete />
                )}
              </Button>
            </div>

            <p>
              {item.city}, {item.street}
            </p>
            <p>შენობის ნომერი: {item.building_number}</p>
            {item.building_entrance && (
              <p>სადარბაზოს ნომერი: {item.building_entrance}</p>
            )}
            {item.building_floor && <p>სართული: {item.building_floor}</p>}
            {item.apartment_number && (
              <p>ბინის ნომერი: {item.apartment_number}</p>
            )}
            <p className="flex-1 p-[5px] bg-gray-100 rounded-[8px]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
