#include <stdio.h>
#include <malloc.h>
#include <conio.h>

int main(){
  int *a = (int *)malloc(sizeof(int)*4);
  free(a);
  _getch();
}
