export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[30px] shadow-md p-6 md:p-10">
        <h1 className="text-[26px] sm:text-3xl md:text-4xl mb-4">
          კონფიდენციალურობის პოლიტიკა
        </h1>
        <p className="text-gray-500 mb-6">
          <strong>ბოლო განახლება:</strong> 20.03.2026
        </p>

        <p className="text-gray-700 mb-8">
          წინამდებარე კონფიდენციალურობის პოლიტიკა განმარტავს, თუ როგორ აგროვებს,
          იყენებს და იცავს თქვენი პერსონალური მონაცემებს ვებგვერდი{" "}
          <span className="font-semibold">შპს „Techero“</span> (შემდგომში
          „პლატფორმა“) <br /> (საიდენტიფიკაციო ნომერი: 439415615).
        </p>

        {/* Section */}
        <Section title="1. შეგროვებული ინფორმაცია">
          <SubTitle>ფიზიკური პირებისთვის:</SubTitle>
          <List
            items={[
              "სახელი და გვარი",
              "ტელეფონის ნომერი",
              "მისამართი",
              "პროფილის სურათი",
            ]}
          />

          <SubTitle>იურიდიული პირებისთვის:</SubTitle>
          <List
            items={[
              "კომპანიის დასახელება",
              "საიდენტიფიკაციო კოდი",
              "კომპანიის წარმომადგენლის სახელი და გვარი",
              "ტელეფონის ნომერი",
              "მისამართი",
              "პროფილის სურათი",
            ]}
          />
        </Section>

        <Section title="2. მონაცემების შეგროვების მიზანი">
          <List
            items={[
              "მომხმარებლის ანგარიშის შექმნა და მართვა",
              "მომხმარებელთან კომუნიკაცია",
              "განცხადებების დამუშავება",
              "პლატფორმის ფუნქციონირების გაუმჯობესება",
            ]}
          />
        </Section>

        <Section title="3. ავტორიზაცია და Cookies">
          <p className="text-gray-700 leading-relaxed">
            პლატფორმა იყენებს Cookies-ს მხოლოდ მომხმარებლის ავტორიზაციისა და
            სესიის მართვისთვის. Cookies არ გამოიყენება მარკეტინგული ან მესამე
            მხარის რეკლამირების მიზნებისთვის.
          </p>
        </Section>

        <Section title="4. მონაცემების გაზიარება">
          <p className="text-gray-700 mb-4">
            ჩვენ არ ვყიდით ან ვაქირავებთ თქვენს მონაცემებს.
          </p>

          <p className="text-gray-700 mb-2">მონაცემები შეიძლება გადაეცეს:</p>

          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>
              პლატფორმაზე რეგისტრირებულ ტექნიკოსებს – მომსახურების შესრულების
              მიზნით
            </li>
            <li>კურიერებს – მომსახურების მიწოდების მიზნით</li>
            <li>
              გადახდის პროვაიდერებს (საქართველოს ბანკი, თიბისი ბანკი) – გადახდის
              დამუშავების მიზნით
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            მონაცემები გადაეცემა მხოლოდ იმ მოცულობით, რაც აუცილებელია შესაბამისი
            მომსახურების განხორციელებისთვის.
          </p>
        </Section>

        <Section title="5. მონაცემების შენახვა და დაცვა">
          <List
            items={[
              "დაცული სერვერები",
              "ავტორიზაციის მექანიზმები",
              "წვდომის კონტროლი",
            ]}
          />
          <p className="text-gray-700 mt-4">
            მონაცემებზე წვდომა აქვთ მხოლოდ უფლებამოსილ პირებს.
          </p>
        </Section>

        <Section title="6. მომხმარებლის უფლებები">
          <List
            items={[
              "იხილოთ თქვენი მონაცემები",
              "შეცვალოთ ინფორმაცია",
              "წაშალოთ ინფორმაცია",
            ]}
          />
          <p className="text-gray-700 mt-4">
            ეს შეგიძლიათ განახორციელოთ თქვენი ანგარიშის საშუალებით.
          </p>
        </Section>

        <Section title="7. მონაცემების შენახვის ვადა">
          <p className="text-gray-700">
            თქვენი მონაცემები ინახება მანამ, სანამ არ მოითხოვთ მათ წაშლას.
          </p>
        </Section>

        <Section title="8. უსაფრთხოება">
          <p className="text-gray-700 leading-relaxed">
            ჩვენ ვიღებთ ყველა გონივრულ ზომას, რათა დავიცვათ თქვენი მონაცემები
            არაავტორიზებული წვდომისგან, დაკარგვისგან და შეცვლისგან. თუმცა,
            ინტერნეტით მონაცემთა გადაცემა სრულად დაცული ვერასოდეს იქნება.
          </p>
        </Section>

        <Section title="9. ცვლილებები პოლიტიკაში">
          <p className="text-gray-700">
            ჩვენ ვიტოვებთ უფლებას შევცვალოთ აღნიშნული პოლიტიკა. განახლებული
            ვერსია გამოქვეყნდება ამავე გვერდზე.
          </p>
        </Section>

        <Section title="10. საკონტაქტო ინფორმაცია">
          <p className="text-gray-700">Email: info@techero.ge</p>
        </Section>
      </div>
    </div>
  );
}

// Reusable components

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-medium text-gray-800 mt-4">{children}</h3>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 text-gray-700 space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
