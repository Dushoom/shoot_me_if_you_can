#include<stdio.h>
#include<param.h>

char buffer[4028];

void main() {

   int i;

   for (i=0; i<=4028; i++)
       buffer[i]='A';

   int a = HZ;
   printf("%d\n",a );
   //syslog(LOG_ERR, buffer);
}