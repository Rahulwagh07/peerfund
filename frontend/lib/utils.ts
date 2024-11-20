import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatAddress = (addr: string) => {
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2)
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(39)}`
}

export const calculateInterest = (
  fundDate: number,
  amount: number,
) => {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const timeElapsed = currentTime - BigInt(fundDate);
  const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);
  const PRECISION = BigInt(1e18);
  const timeInYears = (timeElapsed * PRECISION) / SECONDS_PER_YEAR;
  const interest = (BigInt(amount) * BigInt(20) * timeInYears) /
    (BigInt(100) * PRECISION);

  return interest;
};

