public class factorial {
  public static void main(String[] args){
    System.out.println("recursive: "+factorial_recursive(5));
    System.out.println("iterative: "+factorial_iterative(5));
  }
  public static int factorial_recursive(int num){
    if (num == 1){
      return 1;
    }else{
      return num*factorial_recursive(num-1);
    }
  }
  public static int factorial_iterative(int num){
    int result=1;
    for(int i=1;i<=num;i=i+1){
      result=result*i;
    }
    return result;
  }
}
