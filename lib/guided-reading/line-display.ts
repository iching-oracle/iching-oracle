/** 7,9 = yang; 6,8 = yin. */
export function lineValueIsYang(value: number): boolean {
  return value === 7 || value === 9;
}

export function lineValueIsChanging(value: number): boolean {
  return value === 6 || value === 9;
}
