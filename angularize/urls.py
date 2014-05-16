from django.conf.urls import patterns, url
from django.views.generic import TemplateView
from angularize.views import views

# RESTful stuffs
from tastypie.api import Api
from angularize.api import HostResource, DataResource
from django.conf.urls import include

v1_api = Api(api_name='v1')
v1_api.register(HostResource())

v2_api = Api(api_name='v2')
v2_api.register(DataResource())

urlpatterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
    url(r'^api/', include(v2_api.urls)),
    #url(r'^foo$', views.foo, name='foo'),
    url(r'^$', TemplateView.as_view(template_name='index.html')),
)
