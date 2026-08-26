export interface Validator<T> {
  validate(value: T): boolean;
}

export class EmailValidator implements Validator<string> {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(value: string): boolean {
    return this.emailRegex.test(value);
  }
}