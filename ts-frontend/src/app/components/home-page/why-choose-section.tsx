"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { TbPointFilled } from "react-icons/tb";

export default function WhyChooseSection() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-[30px] sm:gap-[50px] group">
      <div className="flex flex-col gap-y-[20px]">
        <h1 className="text-[28px] text-myGray">
          მარტივი, კომფორტული და სანდო სერვისი თქვენი ტექნიკისთვის
        </h1>
        <p className="text-myLightGray text-[14px] sm:text-[16px]">
          Techero გაგიმარტივებთ ცხოვრებას:
        </p>
        <ul className="space-y-3 text-[15px]">
          <li className="flex items-center gap-1">
            <TbPointFilled className="shrink-0" />
            შეავსეთ სერვისის განაცხადი.
          </li>
          <li className="flex items-center gap-1">
            <TbPointFilled className="shrink-0" />
            მონტაჟის შემთხვევაში ჩვენი ტექნიკოსი მოვა ადგილზე და სწრაფად
            დაამონტაჟებს ტექნიკას.
          </li>
          <li className="flex items-center gap-1">
            <TbPointFilled className="shrink-0" />
            შეკეთების შემთხვევაში ტექნიკა საჭიროების მიხედვით შეკეთდება ადგილზე
            ან უსაფრთხოდ ტრანსპორტირდება სერვისცენტრში და შეკეთების შემდეგ
            დაგიბრუნდებათ.
          </li>
        </ul>
        <Button
          onClick={() => {
            if (currentUser) {
              const path =
                currentUser.role === "individual"
                  ? "/dashboard/individual/orders"
                  : "/dashboard/company/orders";

              router.push(path);
            } else {
              router.push("/auth/login");
              toast.warning("ასარჩევად გაიარე ავტორიზაცია");
            }
          }}
          className="flex h-[45px] px-[20px] sm:px-[30px] self-start cursor-pointer"
        >
          შეავსე განაცხადი
        </Button>
      </div>
      <div className="relative h-[300px] lg:h-auto max-w-[500px] w-full lg:w-auto">
        <img
          src="/images/washingmachine.jpg"
          alt="washing machine"
          className="absolute rounded-[30px] object-cover w-[95%] lg:w-5/6 h-full lg:-top-5 left-2 lg:left-0 -rotate-5 shadow-myShadow"
        />
        <img
          src="/images/truck.png"
          alt="washing machine"
          className="absolute -bottom-10 right-0 lg:-right-4 rotate-5 rounded-[30px] object-cover w-[80%] lg:w-2/3 h-3/4 shadow-lg shadow-[#00000053]"
        />
      </div>
    </div>
  );
}
