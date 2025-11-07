import React from "react";
import UsersCommentsSection from "../components/home-page/users-comments/users-comments-section";
import AboutUsTeamCarousel from "../components/about-us-team-carousel";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center bg-white text-gray-900">
      <AboutUsTeamCarousel />
      <div className="max-w-[1140px] w-full px-4 pt-16 pb-[150px] space-y-24">
        {/* Section 1 */}
        <section className="space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-semibold">ვინ ვართ ჩვენ?</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>Tech Service</strong> — კომპანია, რომელიც აერთიანებს
            გამოცდილ და პროფესიონალ ტექნიკოსებსა და კურიერებს, რათა თქვენს
            საოჯახო ტექნიკას დაუბრუნოს სიცოცხლე სწრაფად, უსაფრთხოდ და
            ხარისხიანად. <br />
            ჩვენი სერვისი უკვე რამდენიმე თვეა რაც მომხმარებლებს სთავაზობს
            მომსახურებას თელავსა და თბილისში. ამ მოკლე პერიოდში მოვიპოვეთ
            მომხმარებელთა ნდობა და მხარდაჭერა — რაც ჩვენთვის ყველაზე დიდი
            მოტივაციაა. <br />
            ჩვენი მიზანია, მომხმარებელს შევთავაზოთ სერვისი, რომელიც ასოცირდება
            პროფესიონალიზმთან, სანდოობასთან, კომფორტთან და კმაყოფილებასთან.
          </p>
        </section>

        {/* Section 2 */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-semibold">რას ვაკეთებთ</h2>
            <p className="text-gray-600 leading-relaxed">
              ჩვენ გთავაზობთ როგორც წვრილი, ისე მსხვილი საოჯახო ტექნიკის
              შეკეთებას და მონტაჟს. ვემსახურებით როგორც კერძო პირებს, ისე
              კომპანიებს.
              <br /> ტექნიკა, რომელზეც ვმუშაობთ:
            </p>
            <ul className="text-gray-600 list-disc ml-6 space-y-1">
              <li>მაცივრები</li>
              <li>ტელევიზორები</li>
              <li>გაზქურები</li>
              <li>მადუღარები</li>
              <li>ტოსტერები</li>
              <li>სხვა საოჯახო ტექნიკა</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              შეკეთება შესაძლებელია ჩვენს სერვისცენტრებში ან ადგილზე — თუ
              დაზიანება მარტივი ხასიათისაა. ჩვენი კურიერები უზრუნველყოფენ
              ტრანსპორტირებას, ხოლო ტექნიკოსები დიაგნოსტიკას და შემდგომ
              შეკეთებას მომხმარებლის თანხმობის შემდეგ.
            </p>
          </div>
          <img
            src="/images/1.webp"
            alt="Repair process"
            className="w-full h-[300px] rounded-2xl object-cover shadow-md"
          />
        </section>

        {/* Section 3 */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <img
            src="/images/1.webp"
            alt="Using website"
            className="w-full h-[300px] rounded-2xl object-cover shadow-md order-2 md:order-1"
          />
          <div className="space-y-6 text-center md:text-left order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-semibold">
              როგორ მუშაობს ჩვენი სერვისი
            </h2>
            <p className="text-gray-600">
              ჩვენი ვებსაიტის საშუალებით მომხმარებელს შეუძლია:
            </p>
            <ul className="text-gray-600 list-disc ml-6 space-y-1">
              <li>შეავსოს სერვისის განაცხადი მარტივად</li>
              <li>დააკვირდეს სამუშაოების პროგრესს რეალურ დროში</li>
              <li>მიიღოს შეტყობინებები შესრულების მიმდინარეობის შესახებ</li>
              <li>დაათვალიეროს სერვისის ისტორია საკუთარ პროფილში</li>
            </ul>
            <p className="text-gray-600">
              ეს ყველაფერი ქმნის გამჭვირვალე და მოსახერხებელ გამოცდილებას.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-semibold">
            გარანტია და სანდოობა
          </h2>
          <p className="text-gray-600 leading-relaxed">
            ყველა ჩვენს მიერ შესრულებულ სერვისზე ვაძლევთ{" "}
            <strong>გარანტიას</strong> — თუ შეკეთებული დეტალი კვლავ გამოვა
            მწყობრიდან ჩვენი შეცდომის გამო (გარეგანი ზემოქმედების გარეშე),
            შეკეთებას სრულიად <strong>უფასოდ</strong> განვახორციელებთ.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold">პარტნიორები</h2>
          <p className="text-gray-600">
            ვთანამშრომლობთ ისეთ წამყვან ბრენდებთან, როგორებიცაა:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {[
              "Bosch",
              "Gorenje",
              "Beko",
              "Samsung",
              "LG",
              "Siemens",
              "Philips",
            ].map((brand) => (
              <div
                key={brand}
                className="bg-gray-50 rounded-xl flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src="/images/logo.png"
                  alt={`${brand} logo`}
                  className="w-full aspect-video object-contain opacity-80 hover:opacity-100 transition"
                />
              </div>
            ))}
          </div>
        </section>

        {/* User Comments */}
        <UsersCommentsSection />
      </div>
    </div>
  );
}
