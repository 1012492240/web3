import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/v2/logo.png";
import { useSearchParams } from "next/navigation";

export default function Logo() {
  const searchParams = useSearchParams();

  return (
    <Link
      href={`/node/${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`}
      className="inline-flex items-center shrink-0"
      aria-label="Logo"
    >
      <Image
        src={logo}
        alt="Logo Text"
        width={93}
        height={23}
        className="w-auto h-5"
      />
    </Link>
  );
}
