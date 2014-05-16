from tastypie.resources import ModelResource
from tastypie import fields
from angularize.models import Host, Data 
import json
from django.http import HttpResponse
import datetime
import random

class HostResource(ModelResource):
    class Meta:
        queryset = Host.objects.all()
        resource_name = 'hosts'

class DataResource(ModelResource):
    host = fields.ToOneField(HostResource, 'host')

    class Meta:
        queryset = Data.objects.all().order_by('timestamp')
        resource_name = 'data'

    def dehydrate(self, bundle):

        # build up some fake data to output ... base it on the 'limit' asked for
        fake_data = []
        base = datetime.datetime.today()
        fake_data = [{'time': (base - (5 * datetime.timedelta(seconds=x))).isoformat(), 'value': random.randint(1, 101)} for x in range(20)]

        # There is a better way to do this, but its just fake data... I can make it more efficient later if needed
        bundle.data['timestamp'] = datetime.datetime.now().isoformat()
        bundle.data['value'] = random.randint(1, 101)
        return bundle

    # Lets hijack the data for assignment purposes :)
    # We want to simulate real time data, so lets fake it
    def get_list(self, request, **kwargs):
        resp = super(DataResource, self).get_list(request, **kwargs)
        data = json.loads(resp.content)

        # build up some fake data to output ... base it on the 'limit' asked for
        fake_data = []
        base = datetime.datetime.today()
        fake_data = [{'time': (base - (5 * datetime.timedelta(seconds=x))).isoformat(), 'value': random.randint(1, 101)} for x in range(0, data['meta']['limit'])]

        # There is a better way to do this, but its just fake data... I can make it more efficient later if needed
        data['fake'] = list(reversed(fake_data))
        data = json.dumps(data)
        return HttpResponse(data, mimetype='application/json', status=200)
