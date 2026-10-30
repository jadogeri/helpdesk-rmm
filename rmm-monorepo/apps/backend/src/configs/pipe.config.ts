import { ValidationPipe, ValidationPipeOptions } from "@nestjs/common";

export const validationPipeConfig = () => {

  const validationPipeOptions: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: true, 

  };
  return new ValidationPipe(validationPipeOptions); 
};
