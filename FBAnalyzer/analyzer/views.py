"""
Views are rendered to form html - page
views.function returns a HttpResponse - that is the .html file content

"""

from django.shortcuts import render


def homepage(request):
    #return HttpResponse('Home')
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def signup(request):
    return render(request, 'sign_up.html')

def about(request):
    return render(request, 'about.html')

def sitemap(request):
    return render(request, 'sitemap.txt')

