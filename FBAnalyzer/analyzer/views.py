"""
Views are rendered to form html - page
views.function returns a HttpResponse - that is the .html file content

"""

from django.shortcuts import render, redirect
from .forms import ContactForm
from django.core.mail import send_mail, BadHeaderError
from django.http import HttpResponse


def homepage(request):
    #return HttpResponse('Home')
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def signup(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            subject = "Website Inquiry from Floorball Scanner"
            body = {
                'first_name': form.cleaned_data['first_name'],
                'last_name': form.cleaned_data['last_name'],
                'email': form.cleaned_data['email_address'],
                'message': form.cleaned_data['message'],
            }
            message = "\n".join(body.values())

            try:
                send_mail(subject, message, 'floorballscanner@gmail.com', ['floorballscanner@gmail.com'])
            except BadHeaderError:
                return HttpResponse('Invalid header found.')
            return redirect("frontpage")

    form = ContactForm(initial={'message': 'I want to know more about Floorball Scanner, please send me more information.'})
    return render(request, 'sign_up.html', {'form': form})

def about(request):
    return render(request, 'about.html')

def live(request):
    return render(request, 'live.html')

