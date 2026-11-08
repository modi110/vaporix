import Image from "next/image";

/**
 * The same mark and name as the top of the customer's card, so the staff
 * screen and the card obviously belong together.
 */
export function StaffBrand() {
  return (
    <div className="staff-brand">
      <Image
        src="/images/card/gauge/mark.png"
        alt=""
        width={150}
        height={150}
        className="staff-brand__mark"
        priority
      />
      <p className="staff-wordmark">Vaporix</p>
    </div>
  );
}
